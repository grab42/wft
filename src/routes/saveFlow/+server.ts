export async function POST(event) {
    const data = await event.request.formData();
    const nodesString = data.get('nodes')?.toString();
	const edgesString = data.get('edges')?.toString();

		if (!nodesString || !edgesString) {
			return ({ message: 'Invalid flowchart data provided.' });
		}

		const nodes = JSON.parse(nodesString);
		const edges = JSON.parse(edgesString);

		if (!nodes || !edges) {
			return ({ message: 'Invalid flowchart data provided.' });
		}
		const { dbConnection } = event.locals;

		try {
			await dbConnection.begin();

			// 1. Create a new experiment
			const expResult = await dbConnection.query(
				'INSERT INTO experiments (user_id, title) VALUES ($1, $2) RETURNING id',
				[event.locals.user.id, 'New Experiment']
			);
			const experimentId = expResult.rows[0].id;

			// 2. Create a new version for this experiment
			const versionResult = await dbConnection.query(
				'INSERT INTO experiment_versions (experiment_id, version_number) VALUES ($1, 1) RETURNING id',
				[experimentId]
			);
			const versionId = versionResult.rows[0].id;

			// 3. Create the flowchart record linked to the version
			const flowResult = await dbConnection.query(
				'INSERT INTO flowcharts (version_id) VALUES ($1) RETURNING id',
				[versionId]
			);
			const flowchartId = flowResult.rows[0].id;

			// 4. Save all nodes
			for (const node of nodes) {
				const nodeQuery = `
					INSERT INTO flowchart_nodes (flowchart_id, node_id, type, position_x, position_y, data, origin_x, origin_y)
					VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
				`;
				await dbConnection.query(nodeQuery, [
					flowchartId,
					node.id,
					node.type,
					node.position.x,
					node.position.y,
					JSON.stringify(node.data),
					node.origin?.[0],
					node.origin?.[1]
				]);
			}

			// 5. Save all edges
			for (const edge of edges) {
				const edgeQuery = `
					INSERT INTO flowchart_edges (flowchart_id, edge_id, source_node_id, target_node_id, type, data)
					VALUES ($1, $2, $3, $4, $5, $6)
				`;
				await dbConnection.query(edgeQuery, [
					flowchartId,
					edge.id,
					edge.source,
					edge.target,
					edge.type,
					JSON.stringify(edge.data)
				]);
			}

			await dbConnection.commit();
			return ({ success: true, message: `Experiment saved with ID: ${experimentId}` });
		} catch (error) {
			await dbConnection.rollback();
			console.error('Failed to save flowchart:', error);
			return ({ message: 'Could not save the flowchart to the database.' });
		}
}